require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test "should be valid with valid attributes" do
    user = User.new(username: "testuser", password: "password123")
    assert user.valid?
  end

  test "should require username" do
    user = User.new(password: "password123")
    assert_not user.valid?
    assert_includes user.errors[:username], "can't be blank"
  end

  test "should require unique username" do
    user = User.new(username: @user.username, password: "password123")
    assert_not user.valid?
    assert_includes user.errors[:username], "has already been taken"
  end

  test "should validate username length" do
    short_user = User.new(username: "ab", password: "password123")
    assert_not short_user.valid?

    long_user = User.new(username: "a" * 33, password: "password123")
    assert_not long_user.valid?
  end

  test "should validate username format" do
    invalid_user = User.new(username: "test@user", password: "password123")
    assert_not invalid_user.valid?
    assert_includes invalid_user.errors[:username], "only allows letters, numbers, underscores, and dashes"
  end

  test "should require password minimum length" do
    user = User.new(username: "testuser", password: "short")
    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 8 characters)"
  end

  test "should allow nil email" do
    user = User.new(username: "testuser", password: "password123", email: nil)
    assert user.valid?
  end

  test "should validate email format when present" do
    user = User.new(username: "testuser", password: "password123", email: "invalid_email")
    assert_not user.valid?
    assert_includes user.errors[:email], "is not a valid email format"
  end

  test "should normalize blank email to nil" do
    user = User.new(username: "testuser", password: "password123", email: "")
    user.valid?
    assert_nil user.email
  end

  test "should require unique email" do
    existing_user = users(:one)
    existing_user.update(email: "unique@example.com")

    new_user = User.new(username: "testuser", password: "password123", email: "unique@example.com")
    assert_not new_user.valid?
    assert_includes new_user.errors[:email], "has already been taken"
  end

  test "should destroy associated entities when destroyed" do
    # Create a new user specifically for this test to avoid interference from fixtures
    user = User.create!(username: "destroy_test_user", password: "password123")
    user.entities.create!(kind: "click_count", count: 5)
    assert_difference("Entity.count", -1) do
      user.destroy
    end
  end

  test "should destroy associated refresh tokens when destroyed" do
    # Create a new user specifically for this test
    user = User.create!(username: "destroy_test_user_2", password: "password123")
    RefreshToken.create!(user: user, token_digest: "digest_test", expires_at: 1.day.from_now)
    assert_difference("RefreshToken.count", -1) do
      user.destroy
    end
  end

  test "should authenticate with correct password" do
    user = User.create!(username: "authtest", password: "password123")
    assert user.authenticate("password123")
  end

  test "should not authenticate with incorrect password" do
    user = User.create!(username: "authtest2", password: "password123")
    assert_not user.authenticate("wrongpassword")
  end
end
