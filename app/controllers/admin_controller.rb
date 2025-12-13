class AdminController < ApplicationController
  before_action :authorize_request
  before_action :authorize_admin

  def stats
    user_count = User.count
    entity_count = Entity.count

    recent_users_scope = User.order(created_at: :desc).limit(5)

    if params[:include_entities] == "true"
      recent_users = recent_users_scope.includes(:entities).as_json(include: :entities)
    else
      recent_users = recent_users_scope
    end

    render json: {
      user_count: user_count,
      entity_count: entity_count,
      recent_users: recent_users
    }
  end

  private

  def authorize_admin
    unless @current_user&.admin?
      render json: { error: "You do not have permission to access this resource" }, status: :forbidden
    end
  end
end
