require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "should create user with valid params" do
    assert_difference("User.count") do
      post "/auth/signup",
        params: { user: { username: "unique_test_user_12345", password: "password123" } },
        as: :json
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_includes json_response, "user"
    assert_includes json_response, "token"
    assert_equal "unique_test_user_12345", json_response["user"]["username"]
  end

  test "should not create user without username" do
    assert_no_difference("User.count") do
      post "/auth/signup",
        params: { user: { password: "password123" } },
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "should not create user without password" do
    assert_no_difference("User.count") do
      post "/auth/signup",
        params: { user: { username: "newuser" } },
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "should not create user with duplicate username" do
    assert_no_difference("User.count") do
      post "/auth/signup",
        params: { user: { username: @user.username, password: "password123" } },
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "should not create user with short password" do
    assert_no_difference("User.count") do
      post "/auth/signup",
        params: { user: { username: "newuser", password: "short" } },
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "should get current user with valid token" do
    token = JsonWebToken.encode(user_id: @user.id)
    get me_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "id"
    assert_includes json_response, "username"
    assert_equal @user.username, json_response["username"]
  end

  test "should not get current user without token" do
    get me_url
    assert_response :unauthorized
  end

  test "should not get current user with invalid token" do
    get me_url, headers: { "Authorization" => "Bearer invalid_token" }
    assert_response :unauthorized
  end
end
