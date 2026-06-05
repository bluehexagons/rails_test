class JsonWebToken
  # Use the application's secret_key_base, which resolves from credentials or the
  # SECRET_KEY_BASE env var in production and a generated secret in dev/test.
  # `credentials.secret_key_base` is nil without a master key, which would sign
  # tokens with an empty (forgeable) key.
  SECRET_KEY = Rails.application.secret_key_base

  # Default: short-lived access token (1 hour). Callers may pass a custom `exp` for longer lifetimes.
  def self.encode(payload, exp = 1.hour.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: "HS256" })[0]
    HashWithIndifferentAccess.new decoded
  end
end
