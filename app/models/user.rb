class User < ApplicationRecord
  has_secure_password

  validates :email, uniqueness: true, allow_nil: true
  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 32 }, format: { with: /\A[a-zA-Z0-9_-]+\z/, message: "only allows letters, numbers, underscores, and dashes" }
end
