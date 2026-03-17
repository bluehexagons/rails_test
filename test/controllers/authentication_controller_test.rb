require "test_helper"

class AuthenticationControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "should login with valid credentials" do
    post auth_login_url, params: { username: @user.username, password: "secret" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "token"
    assert_includes json_response, "refresh_token"
    assert_includes json_response, "username"
    assert_includes json_response, "exp"
    assert_equal @user.username, json_response["username"]
  end

  test "should login with email" do
    @user.update(email: "test@example.com")
    post auth_login_url, params: { email: "test@example.com", password: "secret" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "token"
  end

  test "should not login with invalid credentials" do
    post auth_login_url, params: { username: @user.username, password: "wrongpassword" }
    assert_response :unauthorized

    json_response = JSON.parse(response.body)
    assert_includes json_response, "error"
  end

  test "should not login with non-existent user" do
    post auth_login_url, params: { username: "nonexistent", password: "secret" }
    assert_response :unauthorized
  end

  test "should logout with valid refresh token" do
    refresh_token = RefreshToken.generate_for(@user)

    delete auth_logout_url, params: { refresh_token: refresh_token }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_equal "Logged out successfully", json_response["message"]
  end

  test "should logout without refresh token" do
    delete auth_logout_url
    assert_response :success
  end

  test "should refresh token with valid refresh token" do
    refresh_token = RefreshToken.generate_for(@user)

    post auth_refresh_url, params: { refresh_token: refresh_token }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "token"
    assert_includes json_response, "refresh_token"
    assert_includes json_response, "exp"
  end

  test "should not refresh with invalid token" do
    post auth_refresh_url, params: { refresh_token: "invalid_token" }
    assert_response :unauthorized

    json_response = JSON.parse(response.body)
    assert_includes json_response, "error"
  end

  test "should not refresh without token" do
    post auth_refresh_url
    assert_response :bad_request

    json_response = JSON.parse(response.body)
    assert_includes json_response, "error"
  end

  test "should not reuse revoked refresh token" do
    refresh_token = RefreshToken.generate_for(@user)

    # First refresh - should succeed
    post auth_refresh_url, params: { refresh_token: refresh_token }
    assert_response :success

    # Second refresh with same token - should fail
    post auth_refresh_url, params: { refresh_token: refresh_token }
    assert_response :unauthorized
  end
end
