class AdminController < ApplicationController
  before_action :authorize_request
  before_action :authorize_admin

  def stats
    user_count = User.count
    entity_count = Entity.count
    recent_users = User.order(created_at: :desc).limit(5)

    render json: {
      user_count: user_count,
      entity_count: entity_count,
      recent_users: recent_users
    }
  end

  private

  def authorize_admin
    unless @current_user&.admin?
      render json: { error: "Unauthorized" }, status: :forbidden
    end
  end
end
