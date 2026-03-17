require "test_helper"

class EntitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = JsonWebToken.encode(user_id: @user.id)
  end

  test "should increment counter" do
    post entities_increment_url, headers: { "Authorization" => "Bearer #{@token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "click_count"
    assert_includes json_response, "streak_counter_day"
    assert_includes json_response, "streak_counter_month"
    assert_includes json_response, "streak_counter_year"

    assert_equal 1, json_response["click_count"]["count"]
  end

  test "should increment counter multiple times" do
    # First click
    post entities_increment_url, headers: { "Authorization" => "Bearer #{@token}" }
    assert_response :success
    first_response = JSON.parse(response.body)

    # Second click
    post entities_increment_url, headers: { "Authorization" => "Bearer #{@token}" }
    assert_response :success
    second_response = JSON.parse(response.body)

    assert_equal first_response["click_count"]["count"] + 1, second_response["click_count"]["count"]
  end

  test "should get current entities" do
    # First create some entities by incrementing
    post entities_increment_url, headers: { "Authorization" => "Bearer #{@token}" }

    get entities_current_url, headers: { "Authorization" => "Bearer #{@token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "click_count"
    assert_includes json_response, "streak_counter_day"
    assert_includes json_response, "streak_counter_month"
    assert_includes json_response, "streak_counter_year"
  end

  test "should get current entities when empty" do
    get entities_current_url, headers: { "Authorization" => "Bearer #{@token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_nil json_response["click_count"]
  end

  test "should not increment without authorization" do
    post entities_increment_url
    assert_response :unauthorized
  end

  test "should not get current without authorization" do
    get entities_current_url
    assert_response :unauthorized
  end

  test "should not increment with invalid token" do
    post entities_increment_url, headers: { "Authorization" => "Bearer invalid_token" }
    assert_response :unauthorized
  end
end
