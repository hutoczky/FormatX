using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

var paymentConfiguration = PaymentConfiguration.Load(builder.Configuration, builder.Environment);
builder.Services.AddSingleton(paymentConfiguration);
builder.Services.AddSingleton<BillingRepository>();
builder.Services.AddSingleton<LicenseService>();
builder.Services.AddHttpClient<StripePaymentProvider>();
builder.Services.AddSingleton<IPaymentProvider>(sp =>
{
    if (!string.Equals(paymentConfiguration.PaymentProvider, "stripe", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException($"Unsupported payment provider '{paymentConfiguration.PaymentProvider}'.");
    }

    return sp.GetRequiredService<StripePaymentProvider>();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var origins = paymentConfiguration.AllowedCorsOrigins;
        if (origins.Length == 0)
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            return;
        }

        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("frontend");

await app.Services.GetRequiredService<BillingRepository>().InitializeAsync();

app.MapGet("/health", (PaymentConfiguration config) => Results.Ok(new
{
    ok = true,
    provider = config.PaymentProvider,
    mode = config.PaymentMode
}));

app.MapPost("/api/billing/create-checkout-session", async (CheckoutSessionRequest request, IPaymentProvider paymentProvider, PaymentConfiguration config, CancellationToken cancellationToken) =>
{
    if (!CheckoutSessionRequestValidator.TryValidate(request, out var validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var plan = PlanCatalog.Get(request.PlanId);
    if (plan is null)
    {
        return Results.BadRequest(new { error = "Ismeretlen csomag." });
    }

    if (plan.RequiresQuote)
    {
        return Results.BadRequest(new
        {
            error = "Az Enterprise csomaghoz egyedi ajánlat szükséges.",
            quote_required = true,
            quote_url = "/scifi-ui/support.html"
        });
    }

    if (!PlanCatalog.IsSupportedCycle(request.BillingCycle))
    {
        return Results.BadRequest(new { error = "Érvénytelen számlázási ciklus." });
    }

    var liveReadinessErrors = config.GetLiveReadinessErrors();
    if (config.IsLiveMode && liveReadinessErrors.Count > 0)
    {
        return Results.Json(new
        {
            error = "Live payment is not fully configured",
            details = liveReadinessErrors
        }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var checkoutSession = await paymentProvider.CreateCheckoutSessionAsync(request, plan, cancellationToken);
    return Results.Ok(new
    {
        session_id = checkoutSession.SessionId,
        checkout_url = checkoutSession.CheckoutUrl,
        payment_mode = checkoutSession.PaymentMode,
        payment_provider = checkoutSession.PaymentProvider
    });
});

app.MapGet("/api/billing/session-status", async (string session_id, IPaymentProvider paymentProvider, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(session_id))
    {
        return Results.BadRequest(new { error = "A session_id kötelező." });
    }

    var status = await paymentProvider.GetSubscriptionStatusAsync(session_id, cancellationToken);
    if (status is null)
    {
        return Results.NotFound(new { error = "A megadott session nem található." });
    }

    return Results.Ok(status);
});

app.MapPost("/api/billing/cancel-subscription", async (CancelSubscriptionRequest request, HttpRequest httpRequest, PaymentConfiguration config, IPaymentProvider paymentProvider, BillingRepository repository, CancellationToken cancellationToken) =>
{
    if (!config.IsAdminRequestAuthorized(httpRequest))
    {
        return Results.Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(request.ProviderSubscriptionId) && string.IsNullOrWhiteSpace(request.SessionId))
    {
        return Results.BadRequest(new { error = "Session ID vagy provider subscription ID szükséges." });
    }

    var session = !string.IsNullOrWhiteSpace(request.SessionId)
        ? await repository.GetCheckoutSessionAsync(request.SessionId!, cancellationToken)
        : await repository.GetCheckoutSessionByProviderSubscriptionIdAsync(request.ProviderSubscriptionId!, cancellationToken);

    if (session is null || string.IsNullOrWhiteSpace(session.ProviderSubscriptionId))
    {
        return Results.NotFound(new { error = "Nem található lemondható előfizetés." });
    }

    await paymentProvider.CancelSubscriptionAsync(session.ProviderSubscriptionId, cancellationToken);
    await repository.MarkSubscriptionStateByProviderSubscriptionIdAsync(session.ProviderSubscriptionId, "canceled", "canceled", "Admin cancellation", cancellationToken);

    return Results.Ok(new
    {
        ok = true,
        session_id = session.SessionId,
        provider_subscription_id = session.ProviderSubscriptionId,
        subscription_status = "canceled"
    });
});

app.MapPost("/api/billing/webhooks/stripe", async (HttpRequest httpRequest, IPaymentProvider paymentProvider, BillingRepository repository, ILoggerFactory loggerFactory, CancellationToken cancellationToken) =>
{
    using var reader = new StreamReader(httpRequest.Body, Encoding.UTF8);
    var payload = await reader.ReadToEndAsync(cancellationToken);
    var signatureHeader = httpRequest.Headers["Stripe-Signature"].ToString();
    var logger = loggerFactory.CreateLogger("StripeWebhook");

    if (!paymentProvider.VerifyWebhook(payload, signatureHeader))
    {
        return Results.BadRequest(new { error = "Érvénytelen webhook aláírás." });
    }

    using var document = JsonDocument.Parse(payload);
    var root = document.RootElement;
    var providerEventId = root.GetPropertyOrDefault("id");
    var eventType = root.GetPropertyOrDefault("type");

    if (string.IsNullOrWhiteSpace(providerEventId) || string.IsNullOrWhiteSpace(eventType))
    {
        return Results.BadRequest(new { error = "Hiányzó webhook metaadat." });
    }

    var inserted = await repository.TryInsertPaymentEventAsync(providerEventId, eventType, "received", cancellationToken);
    if (!inserted)
    {
        return Results.Ok(new { ok = true, duplicate = true });
    }

    try
    {
        if (eventType is "checkout.session.completed" or "invoice.paid")
        {
            await paymentProvider.HandlePaymentSuccessAsync(root, cancellationToken);
        }
        else if (eventType is "checkout.session.expired" or "invoice.payment_failed" or "customer.subscription.deleted")
        {
            await paymentProvider.HandlePaymentFailureAsync(root, cancellationToken);
        }

        await repository.SetPaymentEventStatusAsync(providerEventId, "processed", cancellationToken);
        return Results.Ok(new { ok = true });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Stripe webhook feldolgozási hiba: {EventType}", eventType);
        await repository.SetPaymentEventStatusAsync(providerEventId, $"failed: {ex.Message}", cancellationToken);
        return Results.StatusCode(StatusCodes.Status500InternalServerError);
    }
});

app.MapGet("/api/billing/admin/debug", async (HttpRequest httpRequest, PaymentConfiguration config, BillingRepository repository, CancellationToken cancellationToken) =>
{
    if (!config.IsAdminRequestAuthorized(httpRequest))
    {
        return Results.Unauthorized();
    }

    var summary = await repository.GetAdminSummaryAsync(cancellationToken);
    return Results.Ok(new
    {
        payment_mode = config.PaymentMode,
        provider = config.PaymentProvider,
        live_ready = config.GetLiveReadinessErrors().Count == 0,
        live_readiness_errors = config.GetLiveReadinessErrors(),
        active_subscriptions = summary.ActiveSubscriptions,
        created_licenses = summary.CreatedLicenses,
        payment_failures = summary.PaymentFailures,
        recent_events = summary.RecentEvents
    });
});

app.Run();

internal interface IPaymentProvider
{
    Task<CheckoutSessionRecord> CreateCheckoutSessionAsync(CheckoutSessionRequest request, PlanDefinition plan, CancellationToken cancellationToken);
    bool VerifyWebhook(string payload, string? signatureHeader);
    Task HandlePaymentSuccessAsync(JsonElement stripeEvent, CancellationToken cancellationToken);
    Task HandlePaymentFailureAsync(JsonElement stripeEvent, CancellationToken cancellationToken);
    Task<SessionStatusResponse?> GetSubscriptionStatusAsync(string sessionId, CancellationToken cancellationToken);
    Task CancelSubscriptionAsync(string providerSubscriptionId, CancellationToken cancellationToken);
}

internal sealed class StripePaymentProvider(HttpClient httpClient, PaymentConfiguration config, BillingRepository repository, LicenseService licenseService) : IPaymentProvider
{
    private const string StripeApiBaseUrl = "https://api.stripe.com/v1";

    public async Task<CheckoutSessionRecord> CreateCheckoutSessionAsync(CheckoutSessionRequest request, PlanDefinition plan, CancellationToken cancellationToken)
    {
        EnsureProviderConfigured();

        var fields = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["mode"] = "subscription",
            ["success_url"] = AppendQueryParameter(config.PaymentSuccessUrl, "session_id", "{CHECKOUT_SESSION_ID}"),
            ["cancel_url"] = AppendQueryParameter(config.PaymentCancelUrl, "plan_id", plan.Id),
            ["billing_address_collection"] = "required",
            ["customer_email"] = request.Email.Trim(),
            ["metadata[plan_id]"] = plan.Id,
            ["metadata[billing_cycle]"] = request.BillingCycle,
            ["metadata[company_name]"] = request.CompanyName.Trim(),
            ["metadata[contact_name]"] = request.ContactName.Trim(),
            ["metadata[contact_email]"] = request.Email.Trim(),
            ["metadata[billing_address]"] = request.BillingAddress.Trim(),
            ["subscription_data[metadata][plan_id]"] = plan.Id,
            ["subscription_data[metadata][billing_cycle]"] = request.BillingCycle,
            ["subscription_data[metadata][company_name]"] = request.CompanyName.Trim(),
            ["subscription_data[metadata][contact_email]"] = request.Email.Trim(),
            ["allow_promotion_codes"] = "false"
        };

        if (!string.IsNullOrWhiteSpace(request.TaxNumber))
        {
            fields["metadata[tax_number]"] = request.TaxNumber.Trim();
            fields["subscription_data[metadata][tax_number]"] = request.TaxNumber.Trim();
        }

        var configuredPriceId = plan.GetStripePriceId(config.PaymentMode, request.BillingCycle, config.Configuration);
        if (!string.IsNullOrWhiteSpace(configuredPriceId))
        {
            fields["line_items[0][price]"] = configuredPriceId;
        }
        else if (config.IsLiveMode)
        {
            throw new InvalidOperationException("Live payment is not fully configured");
        }
        else
        {
            fields["line_items[0][price_data][currency]"] = "huf";
            fields["line_items[0][price_data][unit_amount]"] = plan.GetAmountForCycle(request.BillingCycle).ToString(CultureInfo.InvariantCulture);
            fields["line_items[0][price_data][product_data][name]"] = plan.Name;
            fields["line_items[0][price_data][product_data][description]"] = plan.Description;
            fields["line_items[0][price_data][recurring][interval]"] = request.BillingCycle == BillingCycles.Annual ? "year" : "month";
        }

        fields["line_items[0][quantity]"] = "1";

        using var response = await SendStripeRequestAsync(HttpMethod.Post, "/checkout/sessions", new FormUrlEncodedContent(fields), cancellationToken);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var root = document.RootElement;
        var sessionId = root.GetPropertyOrDefault("id");
        var checkoutUrl = root.GetPropertyOrDefault("url");

        if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(checkoutUrl))
        {
            throw new InvalidOperationException("Stripe checkout session létrehozása sikertelen.");
        }

        var record = new CheckoutSessionRecord(
            SessionId: sessionId,
            PlanId: plan.Id,
            BillingCycle: request.BillingCycle,
            CompanyName: request.CompanyName.Trim(),
            ContactName: request.ContactName.Trim(),
            ContactEmail: request.Email.Trim(),
            BillingAddress: request.BillingAddress.Trim(),
            TaxNumber: request.TaxNumber?.Trim(),
            PaymentProvider: "stripe",
            PaymentMode: config.PaymentMode,
            ProviderCustomerId: null,
            ProviderSubscriptionId: null,
            SubscriptionStatus: "pending",
            PaymentStatus: "pending",
            CheckoutUrl: checkoutUrl,
            CreatedAtUtc: DateTimeOffset.UtcNow,
            UpdatedAtUtc: DateTimeOffset.UtcNow,
            LastError: null,
            ValidUntilUtc: null);

        await repository.UpsertCheckoutSessionAsync(record, cancellationToken);
        return record;
    }

    public bool VerifyWebhook(string payload, string? signatureHeader)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrWhiteSpace(config.PaymentWebhookSecret))
        {
            return false;
        }

        var parts = signatureHeader.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var timestamp = parts.FirstOrDefault(static part => part.StartsWith("t=", StringComparison.Ordinal))?.Split('=')[1];
        var signature = parts.FirstOrDefault(static part => part.StartsWith("v1=", StringComparison.Ordinal))?.Split('=')[1];

        if (string.IsNullOrWhiteSpace(timestamp) || string.IsNullOrWhiteSpace(signature))
        {
            return false;
        }

        if (!long.TryParse(timestamp, out var timestampSeconds))
        {
            return false;
        }

        var eventTimestamp = DateTimeOffset.FromUnixTimeSeconds(timestampSeconds);
        if (DateTimeOffset.UtcNow - eventTimestamp > TimeSpan.FromMinutes(5))
        {
            return false;
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(config.PaymentWebhookSecret));
        var expectedBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes($"{timestamp}.{payload}"));
        var expectedSignature = Convert.ToHexString(expectedBytes).ToLowerInvariant();
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expectedSignature), Encoding.UTF8.GetBytes(signature));
    }

    public async Task HandlePaymentSuccessAsync(JsonElement stripeEvent, CancellationToken cancellationToken)
    {
        var eventType = stripeEvent.GetPropertyOrDefault("type");
        var dataObject = stripeEvent.GetNestedProperty("data", "object");

        if (eventType == "checkout.session.completed")
        {
            var sessionId = dataObject.GetPropertyOrDefault("id");
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return;
            }

            var session = await repository.GetCheckoutSessionAsync(sessionId, cancellationToken);
            if (session is null)
            {
                return;
            }

            var customerId = dataObject.GetPropertyOrDefault("customer");
            var subscriptionId = dataObject.GetPropertyOrDefault("subscription");
            var paymentStatus = dataObject.GetPropertyOrDefault("payment_status");
            var sessionStatus = string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase) ? "active" : "processing";

            if (!string.IsNullOrWhiteSpace(customerId) || !string.IsNullOrWhiteSpace(subscriptionId))
            {
                await repository.AttachProviderIdentifiersAsync(sessionId, customerId, subscriptionId, cancellationToken);
            }

            if (string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            {
                await ActivateLicenseAsync(session with
                {
                    ProviderCustomerId = customerId,
                    ProviderSubscriptionId = subscriptionId,
                    SubscriptionStatus = sessionStatus,
                    PaymentStatus = paymentStatus
                }, cancellationToken);
                return;
            }

            await repository.MarkSessionStateAsync(sessionId, sessionStatus, paymentStatus, null, cancellationToken);
            return;
        }

        if (eventType == "invoice.paid")
        {
            var subscriptionId = dataObject.GetPropertyOrDefault("subscription");
            if (string.IsNullOrWhiteSpace(subscriptionId))
            {
                return;
            }

            var session = await repository.GetCheckoutSessionByProviderSubscriptionIdAsync(subscriptionId, cancellationToken);
            if (session is null)
            {
                return;
            }

            await ActivateLicenseAsync(session with
            {
                ProviderCustomerId = dataObject.GetPropertyOrDefault("customer") ?? session.ProviderCustomerId,
                ProviderSubscriptionId = subscriptionId,
                SubscriptionStatus = "active",
                PaymentStatus = "paid"
            }, cancellationToken);
        }
    }

    public async Task HandlePaymentFailureAsync(JsonElement stripeEvent, CancellationToken cancellationToken)
    {
        var eventType = stripeEvent.GetPropertyOrDefault("type");
        var dataObject = stripeEvent.GetNestedProperty("data", "object");

        if (eventType == "checkout.session.expired")
        {
            var sessionId = dataObject.GetPropertyOrDefault("id");
            if (!string.IsNullOrWhiteSpace(sessionId))
            {
                await repository.MarkSessionStateAsync(sessionId, "expired", "failed", "A checkout session lejárt.", cancellationToken);
            }

            return;
        }

        var subscriptionId = dataObject.GetPropertyOrDefault("subscription") ?? dataObject.GetPropertyOrDefault("id");
        if (string.IsNullOrWhiteSpace(subscriptionId))
        {
            return;
        }

        if (eventType == "invoice.payment_failed")
        {
            await repository.MarkSubscriptionStateByProviderSubscriptionIdAsync(subscriptionId, "past_due", "failed", "A provider sikertelen fizetést jelzett.", cancellationToken);
            return;
        }

        if (eventType == "customer.subscription.deleted")
        {
            await repository.MarkSubscriptionStateByProviderSubscriptionIdAsync(subscriptionId, "canceled", "canceled", "Az előfizetés megszűnt a providernél.", cancellationToken);
        }
    }

    public async Task<SessionStatusResponse?> GetSubscriptionStatusAsync(string sessionId, CancellationToken cancellationToken)
    {
        var session = await repository.GetCheckoutSessionAsync(sessionId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        var license = await repository.GetLicenseBySessionIdAsync(sessionId, cancellationToken);
        return new SessionStatusResponse(
            SessionId: session.SessionId,
            PlanId: session.PlanId,
            PlanName: PlanCatalog.Get(session.PlanId)?.Name ?? session.PlanId,
            BillingCycle: session.BillingCycle,
            SubscriptionStatus: session.SubscriptionStatus,
            PaymentStatus: session.PaymentStatus,
            LicenseActive: license is not null,
            LicenseKey: license?.LicenseKey,
            Message: license is not null
                ? "Köszönjük az előfizetést. A FormatX Suite Pro licenc aktív."
                : session.PaymentStatus == "paid"
                    ? "A fizetés feldolgozás alatt van. A licenc aktiválása néhány másodpercet vehet igénybe."
                    : session.PaymentStatus == "failed" || session.SubscriptionStatus is "past_due" or "canceled" or "expired"
                        ? "A fizetés nem sikerült vagy megszakadt. Az előfizetés nem aktiválódott."
                        : "A fizetés feldolgozás alatt van. A licenc aktiválása néhány másodpercet vehet igénybe.",
            ValidUntilUtc: license?.ValidUntilUtc,
            CompanyName: session.CompanyName,
            ContactEmail: session.ContactEmail);
    }

    public async Task CancelSubscriptionAsync(string providerSubscriptionId, CancellationToken cancellationToken)
    {
        EnsureProviderConfigured();
        var fields = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["cancel_at_period_end"] = "true"
        };

        using var _ = await SendStripeRequestAsync(HttpMethod.Post, $"/subscriptions/{providerSubscriptionId}", new FormUrlEncodedContent(fields), cancellationToken);
    }

    private async Task ActivateLicenseAsync(CheckoutSessionRecord session, CancellationToken cancellationToken)
    {
        var plan = PlanCatalog.Get(session.PlanId) ?? throw new InvalidOperationException("Hiányzó csomagkonfiguráció.");
        var license = licenseService.CreateLicense(session, plan);
        await repository.ActivateLicenseAsync(session, license, cancellationToken);
    }

    private void EnsureProviderConfigured()
    {
        if (string.IsNullOrWhiteSpace(config.PaymentSecretKey))
        {
            throw new InvalidOperationException("Hiányzó PAYMENT_SECRET_KEY.");
        }
    }

    private async Task<HttpResponseMessage> SendStripeRequestAsync(HttpMethod method, string relativePath, HttpContent? content, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, $"{StripeApiBaseUrl}{relativePath}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", config.PaymentSecretKey);
        request.Content = content;

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode)
        {
            return response;
        }

        var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new InvalidOperationException($"Stripe API hiba: {response.StatusCode} - {errorBody}");
    }

    private static string AppendQueryParameter(string url, string key, string value)
    {
        var separator = url.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return $"{url}{separator}{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value)}";
    }
}

internal static class CheckoutSessionRequestValidator
{
    public static bool TryValidate(CheckoutSessionRequest request, out string error)
    {
        if (string.IsNullOrWhiteSpace(request.PlanId))
        {
            error = "A plan_id kötelező.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.BillingCycle))
        {
            error = "A billing_cycle kötelező.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.CompanyName))
        {
            error = "A cégnév kötelező.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.ContactName))
        {
            error = "A kapcsolattartó neve kötelező.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@', StringComparison.Ordinal))
        {
            error = "Érvényes email cím szükséges.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.BillingAddress))
        {
            error = "A számlázási cím kötelező.";
            return false;
        }

        error = string.Empty;
        return true;
    }
}

internal sealed class BillingRepository(PaymentConfiguration config)
{
    public async Task InitializeAsync()
    {
        EnsureDatabaseDirectory();
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS checkout_sessions (
                session_id TEXT PRIMARY KEY,
                plan_id TEXT NOT NULL,
                billing_cycle TEXT NOT NULL,
                company_name TEXT NOT NULL,
                contact_name TEXT NOT NULL,
                contact_email TEXT NOT NULL,
                billing_address TEXT NOT NULL,
                tax_number TEXT NULL,
                payment_provider TEXT NOT NULL,
                payment_mode TEXT NOT NULL,
                provider_customer_id TEXT NULL,
                provider_subscription_id TEXT NULL,
                subscription_status TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                checkout_url TEXT NOT NULL,
                last_error TEXT NULL,
                created_at_utc TEXT NOT NULL,
                updated_at_utc TEXT NOT NULL,
                valid_until_utc TEXT NULL
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_sessions_provider_subscription_id
                ON checkout_sessions(provider_subscription_id)
                WHERE provider_subscription_id IS NOT NULL;
            CREATE TABLE IF NOT EXISTS licenses (
                license_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL UNIQUE,
                license_key TEXT NOT NULL,
                company_name TEXT NOT NULL,
                contact_email TEXT NOT NULL,
                plan TEXT NOT NULL,
                billing_cycle TEXT NOT NULL,
                max_technicians INTEGER NOT NULL,
                max_devices INTEGER NOT NULL,
                subscription_status TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                payment_provider TEXT NOT NULL,
                provider_customer_id TEXT NULL,
                provider_subscription_id TEXT NULL,
                created_at_utc TEXT NOT NULL,
                valid_until_utc TEXT NOT NULL,
                features_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS payment_events (
                provider_event_id TEXT PRIMARY KEY,
                event_type TEXT NOT NULL,
                processed_at_utc TEXT NOT NULL,
                status TEXT NOT NULL
            );
            """;
        await command.ExecuteNonQueryAsync();
    }

    public async Task UpsertCheckoutSessionAsync(CheckoutSessionRecord record, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO checkout_sessions (
                session_id, plan_id, billing_cycle, company_name, contact_name, contact_email, billing_address, tax_number,
                payment_provider, payment_mode, provider_customer_id, provider_subscription_id, subscription_status,
                payment_status, checkout_url, last_error, created_at_utc, updated_at_utc, valid_until_utc
            ) VALUES (
                $session_id, $plan_id, $billing_cycle, $company_name, $contact_name, $contact_email, $billing_address, $tax_number,
                $payment_provider, $payment_mode, $provider_customer_id, $provider_subscription_id, $subscription_status,
                $payment_status, $checkout_url, $last_error, $created_at_utc, $updated_at_utc, $valid_until_utc
            )
            ON CONFLICT(session_id) DO UPDATE SET
                plan_id = excluded.plan_id,
                billing_cycle = excluded.billing_cycle,
                company_name = excluded.company_name,
                contact_name = excluded.contact_name,
                contact_email = excluded.contact_email,
                billing_address = excluded.billing_address,
                tax_number = excluded.tax_number,
                payment_provider = excluded.payment_provider,
                payment_mode = excluded.payment_mode,
                provider_customer_id = excluded.provider_customer_id,
                provider_subscription_id = excluded.provider_subscription_id,
                subscription_status = excluded.subscription_status,
                payment_status = excluded.payment_status,
                checkout_url = excluded.checkout_url,
                last_error = excluded.last_error,
                updated_at_utc = excluded.updated_at_utc,
                valid_until_utc = excluded.valid_until_utc;
            """;
        AddRecordParameters(command, record);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task AttachProviderIdentifiersAsync(string sessionId, string? customerId, string? subscriptionId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE checkout_sessions
            SET provider_customer_id = COALESCE($provider_customer_id, provider_customer_id),
                provider_subscription_id = COALESCE($provider_subscription_id, provider_subscription_id),
                updated_at_utc = $updated_at_utc
            WHERE session_id = $session_id;
            """;
        command.Parameters.AddWithValue("$session_id", sessionId);
        command.Parameters.AddWithValue("$provider_customer_id", (object?)customerId ?? DBNull.Value);
        command.Parameters.AddWithValue("$provider_subscription_id", (object?)subscriptionId ?? DBNull.Value);
        command.Parameters.AddWithValue("$updated_at_utc", DateTimeOffset.UtcNow.ToString("O"));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task MarkSessionStateAsync(string sessionId, string subscriptionStatus, string paymentStatus, string? lastError, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE checkout_sessions
            SET subscription_status = $subscription_status,
                payment_status = $payment_status,
                last_error = $last_error,
                updated_at_utc = $updated_at_utc
            WHERE session_id = $session_id;
            """;
        command.Parameters.AddWithValue("$session_id", sessionId);
        command.Parameters.AddWithValue("$subscription_status", subscriptionStatus);
        command.Parameters.AddWithValue("$payment_status", paymentStatus);
        command.Parameters.AddWithValue("$last_error", (object?)lastError ?? DBNull.Value);
        command.Parameters.AddWithValue("$updated_at_utc", DateTimeOffset.UtcNow.ToString("O"));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task MarkSubscriptionStateByProviderSubscriptionIdAsync(string providerSubscriptionId, string subscriptionStatus, string paymentStatus, string? lastError, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE checkout_sessions
            SET subscription_status = $subscription_status,
                payment_status = $payment_status,
                last_error = $last_error,
                updated_at_utc = $updated_at_utc
            WHERE provider_subscription_id = $provider_subscription_id;
            UPDATE licenses
            SET subscription_status = $subscription_status,
                payment_status = $payment_status
            WHERE provider_subscription_id = $provider_subscription_id;
            """;
        command.Parameters.AddWithValue("$provider_subscription_id", providerSubscriptionId);
        command.Parameters.AddWithValue("$subscription_status", subscriptionStatus);
        command.Parameters.AddWithValue("$payment_status", paymentStatus);
        command.Parameters.AddWithValue("$last_error", (object?)lastError ?? DBNull.Value);
        command.Parameters.AddWithValue("$updated_at_utc", DateTimeOffset.UtcNow.ToString("O"));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task ActivateLicenseAsync(CheckoutSessionRecord session, LicenseRecord license, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using (var command = connection.CreateCommand())
        {
            command.Transaction = transaction;
            command.CommandText = """
                UPDATE checkout_sessions
                SET provider_customer_id = $provider_customer_id,
                    provider_subscription_id = $provider_subscription_id,
                    subscription_status = 'active',
                    payment_status = 'paid',
                    last_error = NULL,
                    updated_at_utc = $updated_at_utc,
                    valid_until_utc = $valid_until_utc
                WHERE session_id = $session_id;
                """;
            command.Parameters.AddWithValue("$provider_customer_id", (object?)session.ProviderCustomerId ?? DBNull.Value);
            command.Parameters.AddWithValue("$provider_subscription_id", (object?)session.ProviderSubscriptionId ?? DBNull.Value);
            command.Parameters.AddWithValue("$updated_at_utc", DateTimeOffset.UtcNow.ToString("O"));
            command.Parameters.AddWithValue("$valid_until_utc", license.ValidUntilUtc.ToString("O"));
            command.Parameters.AddWithValue("$session_id", session.SessionId);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await using (var command = connection.CreateCommand())
        {
            command.Transaction = transaction;
            command.CommandText = """
                INSERT INTO licenses (
                    license_id, session_id, license_key, company_name, contact_email, plan, billing_cycle,
                    max_technicians, max_devices, subscription_status, payment_status, payment_provider,
                    provider_customer_id, provider_subscription_id, created_at_utc, valid_until_utc, features_json
                ) VALUES (
                    $license_id, $session_id, $license_key, $company_name, $contact_email, $plan, $billing_cycle,
                    $max_technicians, $max_devices, $subscription_status, $payment_status, $payment_provider,
                    $provider_customer_id, $provider_subscription_id, $created_at_utc, $valid_until_utc, $features_json
                )
                ON CONFLICT(session_id) DO UPDATE SET
                    license_id = excluded.license_id,
                    license_key = excluded.license_key,
                    company_name = excluded.company_name,
                    contact_email = excluded.contact_email,
                    plan = excluded.plan,
                    billing_cycle = excluded.billing_cycle,
                    max_technicians = excluded.max_technicians,
                    max_devices = excluded.max_devices,
                    subscription_status = excluded.subscription_status,
                    payment_status = excluded.payment_status,
                    payment_provider = excluded.payment_provider,
                    provider_customer_id = excluded.provider_customer_id,
                    provider_subscription_id = excluded.provider_subscription_id,
                    created_at_utc = excluded.created_at_utc,
                    valid_until_utc = excluded.valid_until_utc,
                    features_json = excluded.features_json;
                """;
            command.Parameters.AddWithValue("$license_id", license.LicenseId);
            command.Parameters.AddWithValue("$session_id", license.SessionId);
            command.Parameters.AddWithValue("$license_key", license.LicenseKey);
            command.Parameters.AddWithValue("$company_name", license.CompanyName);
            command.Parameters.AddWithValue("$contact_email", license.ContactEmail);
            command.Parameters.AddWithValue("$plan", license.Plan);
            command.Parameters.AddWithValue("$billing_cycle", license.BillingCycle);
            command.Parameters.AddWithValue("$max_technicians", license.MaxTechnicians);
            command.Parameters.AddWithValue("$max_devices", license.MaxDevices);
            command.Parameters.AddWithValue("$subscription_status", license.SubscriptionStatus);
            command.Parameters.AddWithValue("$payment_status", license.PaymentStatus);
            command.Parameters.AddWithValue("$payment_provider", license.PaymentProvider);
            command.Parameters.AddWithValue("$provider_customer_id", (object?)license.ProviderCustomerId ?? DBNull.Value);
            command.Parameters.AddWithValue("$provider_subscription_id", (object?)license.ProviderSubscriptionId ?? DBNull.Value);
            command.Parameters.AddWithValue("$created_at_utc", license.CreatedAtUtc.ToString("O"));
            command.Parameters.AddWithValue("$valid_until_utc", license.ValidUntilUtc.ToString("O"));
            command.Parameters.AddWithValue("$features_json", JsonSerializer.Serialize(license.Features));
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    public async Task<bool> TryInsertPaymentEventAsync(string providerEventId, string eventType, string status, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO payment_events (provider_event_id, event_type, processed_at_utc, status)
            VALUES ($provider_event_id, $event_type, $processed_at_utc, $status)
            ON CONFLICT(provider_event_id) DO NOTHING;
            """;
        command.Parameters.AddWithValue("$provider_event_id", providerEventId);
        command.Parameters.AddWithValue("$event_type", eventType);
        command.Parameters.AddWithValue("$processed_at_utc", DateTimeOffset.UtcNow.ToString("O"));
        command.Parameters.AddWithValue("$status", status);
        return await command.ExecuteNonQueryAsync(cancellationToken) > 0;
    }

    public async Task SetPaymentEventStatusAsync(string providerEventId, string status, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE payment_events
            SET processed_at_utc = $processed_at_utc,
                status = $status
            WHERE provider_event_id = $provider_event_id;
            """;
        command.Parameters.AddWithValue("$provider_event_id", providerEventId);
        command.Parameters.AddWithValue("$processed_at_utc", DateTimeOffset.UtcNow.ToString("O"));
        command.Parameters.AddWithValue("$status", status);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<CheckoutSessionRecord?> GetCheckoutSessionAsync(string sessionId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT * FROM checkout_sessions WHERE session_id = $session_id LIMIT 1;";
        command.Parameters.AddWithValue("$session_id", sessionId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapSession(reader) : null;
    }

    public async Task<CheckoutSessionRecord?> GetCheckoutSessionByProviderSubscriptionIdAsync(string providerSubscriptionId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT * FROM checkout_sessions WHERE provider_subscription_id = $provider_subscription_id LIMIT 1;";
        command.Parameters.AddWithValue("$provider_subscription_id", providerSubscriptionId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapSession(reader) : null;
    }

    public async Task<LicenseRecord?> GetLicenseBySessionIdAsync(string sessionId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT * FROM licenses WHERE session_id = $session_id LIMIT 1;";
        command.Parameters.AddWithValue("$session_id", sessionId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapLicense(reader) : null;
    }

    public async Task<AdminSummary> GetAdminSummaryAsync(CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);

        var activeSubscriptions = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM checkout_sessions WHERE subscription_status = 'active';", cancellationToken);
        var createdLicenses = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM licenses;", cancellationToken);
        var paymentFailures = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM payment_events WHERE status LIKE 'failed%';", cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT provider_event_id, event_type, processed_at_utc, status FROM payment_events ORDER BY processed_at_utc DESC LIMIT 10;";
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var events = new List<PaymentEventSummary>();
        while (await reader.ReadAsync(cancellationToken))
        {
            events.Add(new PaymentEventSummary(
                ProviderEventId: reader.GetString(0),
                EventType: reader.GetString(1),
                ProcessedAtUtc: DateTimeOffset.Parse(reader.GetString(2), CultureInfo.InvariantCulture),
                Status: reader.GetString(3)));
        }

        return new AdminSummary(activeSubscriptions, createdLicenses, paymentFailures, events);
    }

    private static async Task<int> ExecuteScalarIntAsync(SqliteConnection connection, string sql, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture);
    }

    private async Task<SqliteConnection> OpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new SqliteConnection(config.DatabaseConnectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }

    private void EnsureDatabaseDirectory()
    {
        var builder = new SqliteConnectionStringBuilder(config.DatabaseConnectionString);
        if (!string.IsNullOrWhiteSpace(builder.DataSource))
        {
            var fullPath = Path.GetFullPath(builder.DataSource);
            var directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }
    }

    private static void AddRecordParameters(SqliteCommand command, CheckoutSessionRecord record)
    {
        command.Parameters.AddWithValue("$session_id", record.SessionId);
        command.Parameters.AddWithValue("$plan_id", record.PlanId);
        command.Parameters.AddWithValue("$billing_cycle", record.BillingCycle);
        command.Parameters.AddWithValue("$company_name", record.CompanyName);
        command.Parameters.AddWithValue("$contact_name", record.ContactName);
        command.Parameters.AddWithValue("$contact_email", record.ContactEmail);
        command.Parameters.AddWithValue("$billing_address", record.BillingAddress);
        command.Parameters.AddWithValue("$tax_number", (object?)record.TaxNumber ?? DBNull.Value);
        command.Parameters.AddWithValue("$payment_provider", record.PaymentProvider);
        command.Parameters.AddWithValue("$payment_mode", record.PaymentMode);
        command.Parameters.AddWithValue("$provider_customer_id", (object?)record.ProviderCustomerId ?? DBNull.Value);
        command.Parameters.AddWithValue("$provider_subscription_id", (object?)record.ProviderSubscriptionId ?? DBNull.Value);
        command.Parameters.AddWithValue("$subscription_status", record.SubscriptionStatus);
        command.Parameters.AddWithValue("$payment_status", record.PaymentStatus);
        command.Parameters.AddWithValue("$checkout_url", record.CheckoutUrl);
        command.Parameters.AddWithValue("$last_error", (object?)record.LastError ?? DBNull.Value);
        command.Parameters.AddWithValue("$created_at_utc", record.CreatedAtUtc.ToString("O"));
        command.Parameters.AddWithValue("$updated_at_utc", record.UpdatedAtUtc.ToString("O"));
        command.Parameters.AddWithValue("$valid_until_utc", record.ValidUntilUtc?.ToString("O") ?? (object)DBNull.Value);
    }

    private static CheckoutSessionRecord MapSession(SqliteDataReader reader)
    {
        return new CheckoutSessionRecord(
            SessionId: reader.GetString(reader.GetOrdinal("session_id")),
            PlanId: reader.GetString(reader.GetOrdinal("plan_id")),
            BillingCycle: reader.GetString(reader.GetOrdinal("billing_cycle")),
            CompanyName: reader.GetString(reader.GetOrdinal("company_name")),
            ContactName: reader.GetString(reader.GetOrdinal("contact_name")),
            ContactEmail: reader.GetString(reader.GetOrdinal("contact_email")),
            BillingAddress: reader.GetString(reader.GetOrdinal("billing_address")),
            TaxNumber: reader.IsDBNull(reader.GetOrdinal("tax_number")) ? null : reader.GetString(reader.GetOrdinal("tax_number")),
            PaymentProvider: reader.GetString(reader.GetOrdinal("payment_provider")),
            PaymentMode: reader.GetString(reader.GetOrdinal("payment_mode")),
            ProviderCustomerId: reader.IsDBNull(reader.GetOrdinal("provider_customer_id")) ? null : reader.GetString(reader.GetOrdinal("provider_customer_id")),
            ProviderSubscriptionId: reader.IsDBNull(reader.GetOrdinal("provider_subscription_id")) ? null : reader.GetString(reader.GetOrdinal("provider_subscription_id")),
            SubscriptionStatus: reader.GetString(reader.GetOrdinal("subscription_status")),
            PaymentStatus: reader.GetString(reader.GetOrdinal("payment_status")),
            CheckoutUrl: reader.GetString(reader.GetOrdinal("checkout_url")),
            CreatedAtUtc: DateTimeOffset.Parse(reader.GetString(reader.GetOrdinal("created_at_utc")), CultureInfo.InvariantCulture),
            UpdatedAtUtc: DateTimeOffset.Parse(reader.GetString(reader.GetOrdinal("updated_at_utc")), CultureInfo.InvariantCulture),
            LastError: reader.IsDBNull(reader.GetOrdinal("last_error")) ? null : reader.GetString(reader.GetOrdinal("last_error")),
            ValidUntilUtc: reader.IsDBNull(reader.GetOrdinal("valid_until_utc")) ? null : DateTimeOffset.Parse(reader.GetString(reader.GetOrdinal("valid_until_utc")), CultureInfo.InvariantCulture));
    }

    private static LicenseRecord MapLicense(SqliteDataReader reader)
    {
        var features = JsonSerializer.Deserialize<string[]>(reader.GetString(reader.GetOrdinal("features_json"))) ?? [];
        return new LicenseRecord(
            LicenseId: reader.GetString(reader.GetOrdinal("license_id")),
            SessionId: reader.GetString(reader.GetOrdinal("session_id")),
            LicenseKey: reader.GetString(reader.GetOrdinal("license_key")),
            CompanyName: reader.GetString(reader.GetOrdinal("company_name")),
            ContactEmail: reader.GetString(reader.GetOrdinal("contact_email")),
            Plan: reader.GetString(reader.GetOrdinal("plan")),
            BillingCycle: reader.GetString(reader.GetOrdinal("billing_cycle")),
            MaxTechnicians: reader.GetInt32(reader.GetOrdinal("max_technicians")),
            MaxDevices: reader.GetInt32(reader.GetOrdinal("max_devices")),
            SubscriptionStatus: reader.GetString(reader.GetOrdinal("subscription_status")),
            PaymentStatus: reader.GetString(reader.GetOrdinal("payment_status")),
            PaymentProvider: reader.GetString(reader.GetOrdinal("payment_provider")),
            ProviderCustomerId: reader.IsDBNull(reader.GetOrdinal("provider_customer_id")) ? null : reader.GetString(reader.GetOrdinal("provider_customer_id")),
            ProviderSubscriptionId: reader.IsDBNull(reader.GetOrdinal("provider_subscription_id")) ? null : reader.GetString(reader.GetOrdinal("provider_subscription_id")),
            CreatedAtUtc: DateTimeOffset.Parse(reader.GetString(reader.GetOrdinal("created_at_utc")), CultureInfo.InvariantCulture),
            ValidUntilUtc: DateTimeOffset.Parse(reader.GetString(reader.GetOrdinal("valid_until_utc")), CultureInfo.InvariantCulture),
            Features: features);
    }
}

internal sealed class LicenseService(PaymentConfiguration config)
{
    public LicenseRecord CreateLicense(CheckoutSessionRecord session, PlanDefinition plan)
    {
        var createdAt = DateTimeOffset.UtcNow;
        var validUntil = session.BillingCycle == BillingCycles.Annual ? createdAt.AddYears(1) : createdAt.AddMonths(1);
        var licenseId = Guid.NewGuid().ToString("N");
        var planSegment = plan.LicenseSegment;
        var hash = ComputeDeterministicHash($"{session.SessionId}|{session.ContactEmail}|{session.CompanyName}|{session.BillingCycle}");
        var chunks = Enumerable.Range(0, 3)
            .Select(index => hash.Substring(index * 4, 4))
            .ToArray();

        return new LicenseRecord(
            LicenseId: licenseId,
            SessionId: session.SessionId,
            LicenseKey: $"FXPRO-{planSegment}-{string.Join('-', chunks)}",
            CompanyName: session.CompanyName,
            ContactEmail: session.ContactEmail,
            Plan: plan.Id,
            BillingCycle: session.BillingCycle,
            MaxTechnicians: plan.MaxTechnicians,
            MaxDevices: plan.MaxDevices,
            SubscriptionStatus: "active",
            PaymentStatus: "paid",
            PaymentProvider: session.PaymentProvider,
            ProviderCustomerId: session.ProviderCustomerId,
            ProviderSubscriptionId: session.ProviderSubscriptionId,
            CreatedAtUtc: createdAt,
            ValidUntilUtc: validUntil,
            Features:
            [
                "secure_checkout",
                "webhook_activated",
                $"plan:{plan.Id}",
                $"billing_cycle:{session.BillingCycle}",
                $"max_technicians:{plan.MaxTechnicians}",
                $"max_devices:{plan.MaxDevices}"
            ]);
    }

    private string ComputeDeterministicHash(string payload)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(config.LicenseSecret));
        var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(bytes);
    }
}

internal sealed class PaymentConfiguration
{
    private PaymentConfiguration()
    {
    }

    public required IConfiguration Configuration { get; init; }
    public required string PaymentProvider { get; init; }
    public required string PaymentMode { get; init; }
    public required string PaymentPublicKey { get; init; }
    public required string PaymentSecretKey { get; init; }
    public required string PaymentWebhookSecret { get; init; }
    public required string PaymentSuccessUrl { get; init; }
    public required string PaymentCancelUrl { get; init; }
    public required string DatabaseConnectionString { get; init; }
    public required string LicenseSecret { get; init; }
    public required string LicenseIssuer { get; init; }
    public required string FrontendUrl { get; init; }
    public required string BackendUrl { get; init; }
    public required string SupportEmail { get; init; }
    public required string AdminDebugToken { get; init; }
    public string[] AllowedCorsOrigins => string.IsNullOrWhiteSpace(FrontendUrl) ? [] : [FrontendUrl.TrimEnd('/')];
    public bool IsLiveMode => string.Equals(PaymentMode, PaymentModes.Live, StringComparison.OrdinalIgnoreCase);

    public static PaymentConfiguration Load(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var databaseUrl = GetValue(configuration, "DATABASE_URL");
        if (string.IsNullOrWhiteSpace(databaseUrl))
        {
            databaseUrl = $"Data Source={Path.Combine(environment.ContentRootPath, "App_Data", "billing.db")}";
        }

        return new PaymentConfiguration
        {
            Configuration = configuration,
            PaymentProvider = GetValue(configuration, "PAYMENT_PROVIDER", "stripe"),
            PaymentMode = GetValue(configuration, "PAYMENT_MODE", PaymentModes.Test),
            PaymentPublicKey = GetValue(configuration, "PAYMENT_PUBLIC_KEY"),
            PaymentSecretKey = GetValue(configuration, "PAYMENT_SECRET_KEY"),
            PaymentWebhookSecret = GetValue(configuration, "PAYMENT_WEBHOOK_SECRET"),
            PaymentSuccessUrl = GetValue(configuration, "PAYMENT_SUCCESS_URL", "http://localhost:8080/scifi-ui/payment/success.html"),
            PaymentCancelUrl = GetValue(configuration, "PAYMENT_CANCEL_URL", "http://localhost:8080/scifi-ui/payment/cancel.html"),
            DatabaseConnectionString = databaseUrl,
            LicenseSecret = GetValue(configuration, "LICENSE_SECRET", "dev-license-secret-change-me"),
            LicenseIssuer = GetValue(configuration, "LICENSE_ISSUER", "FormatX Suite Pro"),
            FrontendUrl = GetValue(configuration, "FRONTEND_URL", "http://localhost:8080"),
            BackendUrl = GetValue(configuration, "BACKEND_URL", "http://localhost:5099"),
            SupportEmail = GetValue(configuration, "SUPPORT_EMAIL"),
            AdminDebugToken = GetValue(configuration, "ADMIN_DEBUG_TOKEN")
        };
    }

    public List<string> GetLiveReadinessErrors()
    {
        var errors = new List<string>();
        if (!IsLiveMode)
        {
            return errors;
        }

        if (string.IsNullOrWhiteSpace(PaymentSecretKey)) errors.Add("PAYMENT_SECRET_KEY hiányzik.");
        if (string.IsNullOrWhiteSpace(PaymentWebhookSecret)) errors.Add("PAYMENT_WEBHOOK_SECRET hiányzik.");
        if (string.IsNullOrWhiteSpace(PaymentSuccessUrl) || !IsHttpsUrl(PaymentSuccessUrl)) errors.Add("PAYMENT_SUCCESS_URL éles HTTPS URL kell legyen.");
        if (string.IsNullOrWhiteSpace(PaymentCancelUrl) || !IsHttpsUrl(PaymentCancelUrl)) errors.Add("PAYMENT_CANCEL_URL éles HTTPS URL kell legyen.");
        if (string.IsNullOrWhiteSpace(DatabaseConnectionString)) errors.Add("DATABASE_URL hiányzik.");
        if (string.IsNullOrWhiteSpace(FrontendUrl) || !IsHttpsUrl(FrontendUrl)) errors.Add("FRONTEND_URL éles HTTPS URL kell legyen.");
        if (string.IsNullOrWhiteSpace(BackendUrl) || !IsHttpsUrl(BackendUrl)) errors.Add("BACKEND_URL éles HTTPS URL kell legyen.");
        if (string.IsNullOrWhiteSpace(LicenseSecret)) errors.Add("LICENSE_SECRET hiányzik.");
        if (string.IsNullOrWhiteSpace(SupportEmail)) errors.Add("SUPPORT_EMAIL hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_BUSINESS_LITE_MONTHLY"])) errors.Add("STRIPE_PRICE_ID_BUSINESS_LITE_MONTHLY hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_BUSINESS_LITE_ANNUAL"])) errors.Add("STRIPE_PRICE_ID_BUSINESS_LITE_ANNUAL hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_BUSINESS_PRO_MONTHLY"])) errors.Add("STRIPE_PRICE_ID_BUSINESS_PRO_MONTHLY hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_BUSINESS_PRO_ANNUAL"])) errors.Add("STRIPE_PRICE_ID_BUSINESS_PRO_ANNUAL hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_TECHNICIAN_TEAM_MONTHLY"])) errors.Add("STRIPE_PRICE_ID_TECHNICIAN_TEAM_MONTHLY hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["STRIPE_PRICE_ID_TECHNICIAN_TEAM_ANNUAL"])) errors.Add("STRIPE_PRICE_ID_TECHNICIAN_TEAM_ANNUAL hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["TERMS_URL"])) errors.Add("TERMS_URL hiányzik.");
        if (string.IsNullOrWhiteSpace(Configuration["PRIVACY_URL"])) errors.Add("PRIVACY_URL hiányzik.");
        return errors;
    }

    public bool IsAdminRequestAuthorized(HttpRequest request)
    {
        if (string.IsNullOrWhiteSpace(AdminDebugToken))
        {
            return false;
        }

        var suppliedToken = request.Headers["X-Admin-Debug-Token"].ToString();
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(AdminDebugToken),
            Encoding.UTF8.GetBytes(suppliedToken));
    }

    private static string GetValue(IConfiguration configuration, string key, string fallback = "") => configuration[key] ?? Environment.GetEnvironmentVariable(key) ?? fallback;

    private static bool IsHttpsUrl(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
}

internal static class PlanCatalog
{
    private static readonly IReadOnlyDictionary<string, PlanDefinition> Plans = new Dictionary<string, PlanDefinition>(StringComparer.OrdinalIgnoreCase)
    {
        ["business_lite"] = new("business_lite", "Business Lite", "FormatX Suite Pro Business Lite", 19_900, 199_000, 1, 10, false, "BUSINESS", "Belépő vállalati előfizetés 1 technikushoz és 10 gépig."),
        ["business_pro"] = new("business_pro", "Business Pro", "FormatX Suite Pro Business Pro", 49_900, 499_000, 3, 50, false, "BUSINESS", "Haladó vállalati előfizetés 3 technikushoz és 50 gépig."),
        ["technician_team"] = new("technician_team", "Technician Team", "FormatX Suite Pro Technician Team", 99_900, 999_000, 5, 150, false, "TEAM", "Több technikusos előfizetés 150 gépig."),
        ["enterprise"] = new("enterprise", "Enterprise", "FormatX Suite Pro Enterprise", 199_000, 1_990_000, 0, 0, true, "ENTERPRISE", "Egyedi ajánlatkérés nagyvállalati környezethez.")
    };

    public static PlanDefinition? Get(string planId) => Plans.TryGetValue(planId, out var plan) ? plan : null;
    public static bool IsSupportedCycle(string cycle) => cycle is BillingCycles.Monthly or BillingCycles.Annual;
}

internal readonly record struct PlanDefinition(
    string Id,
    string Name,
    string ProductName,
    int MonthlyAmount,
    int AnnualAmount,
    int MaxTechnicians,
    int MaxDevices,
    bool RequiresQuote,
    string LicenseSegment,
    string Description)
{
    public int GetAmountForCycle(string cycle) => cycle == BillingCycles.Annual ? AnnualAmount : MonthlyAmount;

    public string? GetStripePriceId(string paymentMode, string billingCycle, IConfiguration configuration)
    {
        var suffix = billingCycle == BillingCycles.Annual ? "ANNUAL" : "MONTHLY";
        var key = $"STRIPE_PRICE_ID_{Id.ToUpperInvariant()}_{suffix}";
        return configuration[key];
    }
}

internal static class PaymentModes
{
    public const string Test = "test";
    public const string Live = "live";
}

internal static class BillingCycles
{
    public const string Monthly = "monthly";
    public const string Annual = "annual";
}

internal sealed record CheckoutSessionRequest(
    string PlanId,
    string BillingCycle,
    string CompanyName,
    string ContactName,
    string Email,
    string BillingAddress,
    string? TaxNumber);

internal sealed record CancelSubscriptionRequest(string? SessionId, string? ProviderSubscriptionId);

internal sealed record CheckoutSessionRecord(
    string SessionId,
    string PlanId,
    string BillingCycle,
    string CompanyName,
    string ContactName,
    string ContactEmail,
    string BillingAddress,
    string? TaxNumber,
    string PaymentProvider,
    string PaymentMode,
    string? ProviderCustomerId,
    string? ProviderSubscriptionId,
    string SubscriptionStatus,
    string PaymentStatus,
    string CheckoutUrl,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    string? LastError,
    DateTimeOffset? ValidUntilUtc);

internal sealed record LicenseRecord(
    string LicenseId,
    string SessionId,
    string LicenseKey,
    string CompanyName,
    string ContactEmail,
    string Plan,
    string BillingCycle,
    int MaxTechnicians,
    int MaxDevices,
    string SubscriptionStatus,
    string PaymentStatus,
    string PaymentProvider,
    string? ProviderCustomerId,
    string? ProviderSubscriptionId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset ValidUntilUtc,
    IReadOnlyCollection<string> Features);

internal sealed record SessionStatusResponse(
    string SessionId,
    string PlanId,
    string PlanName,
    string BillingCycle,
    string SubscriptionStatus,
    string PaymentStatus,
    bool LicenseActive,
    string? LicenseKey,
    string Message,
    DateTimeOffset? ValidUntilUtc,
    string CompanyName,
    string ContactEmail);

internal sealed record PaymentEventSummary(string ProviderEventId, string EventType, DateTimeOffset ProcessedAtUtc, string Status);

internal sealed record AdminSummary(int ActiveSubscriptions, int CreatedLicenses, int PaymentFailures, IReadOnlyCollection<PaymentEventSummary> RecentEvents);

internal static class JsonElementExtensions
{
    public static string? GetPropertyOrDefault(this JsonElement element, string propertyName)
    {
        return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var property) && property.ValueKind switch
        {
            JsonValueKind.String => property.GetString(),
            JsonValueKind.Number => property.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => null
        };
    }

    public static JsonElement GetNestedProperty(this JsonElement element, string parentName, string childName)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parentName, out var parent) && parent.ValueKind == JsonValueKind.Object && parent.TryGetProperty(childName, out var child))
        {
            return child;
        }

        return default;
    }
}
