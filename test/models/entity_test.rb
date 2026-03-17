require "test_helper"

class EntityTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test "should be valid with valid attributes" do
    entity = Entity.new(user: @user, kind: "click_count", count: 0)
    assert entity.valid?
  end

  test "should require user" do
    entity = Entity.new(kind: "click_count", count: 0)
    assert_not entity.valid?
  end

  test "should enforce unique user_id and kind combination" do
    Entity.create!(user: @user, kind: "unique_kind_test", count: 0)

    duplicate = Entity.new(user: @user, kind: "unique_kind_test", count: 5)
    assert_raises(ActiveRecord::RecordNotUnique) do
      duplicate.save(validate: false)
    end
  end

  test "should accept various count values" do
    entity = Entity.new(user: @user, kind: "click_count", count: 100)
    assert entity.valid?
  end

  test "should update modified_time on changes" do
    entity = Entity.create!(user: @user, kind: "test_modified_time", count: 0)
    original_time = entity.modified_time

    sleep(0.1) # Ensure time difference
    entity.count += 1
    entity.save!

    assert entity.modified_time >= original_time
  end
end
