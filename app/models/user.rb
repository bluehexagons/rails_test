class User < ApplicationRecord
  has_secure_password
  has_many :entities, dependent: :destroy
  has_many :refresh_tokens, dependent: :delete_all

  before_validation :normalize_email

  validates :email, uniqueness: true, allow_nil: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email format" }
  validates :password, length: { minimum: 8, maximum: 128 }, if: -> { new_record? || !password.nil? }
  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 32 }, format: { with: /\A[a-zA-Z0-9_-]+\z/, message: "only allows letters, numbers, underscores, and dashes" }

  private

  def normalize_email
    self.email = nil if email.blank?
  end
end
