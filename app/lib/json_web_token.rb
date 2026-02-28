class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base.to_s

  # Default: short-lived access token (1 hour). Callers may pass a custom `exp` for longer lifetimes.
  def self.encode(payload, exp = 1.hour.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  end
end
