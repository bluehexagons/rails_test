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

  test "should list users as admin with pagination meta" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_users_url, params: { page: 1, per_page: 1 }, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "users"
    assert_includes json_response, "meta"
    assert_equal 1, json_response["meta"]["page"]
    assert_equal 1, json_response["meta"]["per_page"]
    assert_operator json_response["meta"]["total"], :>=, 2

    users = json_response["users"]
    assert_equal 1, users.length
    assert_includes users.first, "username"
    assert_includes users.first, "created_at"
  end

  test "should list users with entities when requested" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_users_url, params: { include_entities: "true" }, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    users = json_response["users"]
    assert_not_empty users

    # Fixture users have fixture entities; when include_entities=true, entities should be present.
    assert_includes users.first, "entities"
  end

  test "should not list users as non-admin" do
    token = JsonWebToken.encode(user_id: @user.id)
    get admin_users_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :forbidden
  end

  test "should not list users without login" do
    get admin_users_url
    assert_response :unauthorized
  end

  test "should export users as admin" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_export_users_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "exported_at"
    assert_includes json_response, "total_users"
    assert_includes json_response, "users"
    assert_operator json_response["total_users"], :>=, 2
    assert_includes json_response["users"].first, "username"
    assert_includes json_response["users"].first, "updated_at"
  end

  test "should export users with entities when requested" do
    token = JsonWebToken.encode(user_id: @admin.id)
    get admin_export_users_url, params: { include_entities: "true" }, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    json_response = JSON.parse(response.body)
    users = json_response["users"]
    assert_not_empty users
    assert_includes users.first, "entities"
  end

  test "should not export users as non-admin" do
    token = JsonWebToken.encode(user_id: @user.id)
    get admin_export_users_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :forbidden
  end

  test "should not export users without login" do
    get admin_export_users_url
    assert_response :unauthorized
  end
end
