require "test_helper"

class AdminControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = users(:one)
    @admin.update(admin: true)
    @user = users(:two)
    @user.update(admin: false)
  end

  test "should get stats as admin" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_stats_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, "user_count"
    assert_includes json_response, "entity_count"
  end

  test "should get stats with entities as admin" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_stats_url, params: { include_entities: "true" }, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success
    json_response = JSON.parse(response.body)

    recent_users = json_response["recent_users"]
    assert_not_empty recent_users
    assert_includes recent_users.first, "entities"
  end

  test "should not get stats as non-admin" do
    token = JsonWebToken.encode(user_id: @user.id)
    get admin_stats_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :forbidden
  end

  test "should not get stats without login" do
    get admin_stats_url
    assert_response :unauthorized
  end
end
