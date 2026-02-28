class RefreshToken < ApplicationRecord
  belongs_to :user

  # store and compare via a digest to avoid storing raw tokens
  def self.generate_for(user, lifetime: 60.days)
    raw = SecureRandom.urlsafe_base64(64)
    digest = digest_token(raw)
    create!(user: user, token_digest: digest, expires_at: Time.current + lifetime)
    raw
  end

  def self.digest_token(raw)
    Digest::SHA256.hexdigest(raw)
  end

  def matches?(raw)
    return false if revoked? || expires_at < Time.current
    ActiveSupport::SecurityUtils.secure_compare(self.class.digest_token(raw), token_digest)
  end
end
