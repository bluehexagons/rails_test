class AdminController < ApplicationController
  before_action :authorize_request
  before_action :authorize_admin

  DEFAULT_PER_PAGE = 25
  MAX_PER_PAGE = 100

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

  def users
    include_entities = params[:include_entities] == "true"
    page = params[:page].to_i
    per_page = params[:per_page].to_i

    page = 1 if page < 1
    per_page = DEFAULT_PER_PAGE if per_page < 1
    per_page = MAX_PER_PAGE if per_page > MAX_PER_PAGE

    scope = User.order(created_at: :desc)
    scope = scope.includes(:entities) if include_entities

    total = scope.count
    total_pages = (total.to_f / per_page).ceil
    offset = (page - 1) * per_page

    users = scope.offset(offset).limit(per_page)

    users_json = if include_entities
      users.as_json(
        only: %i[id username email admin created_at],
        include: {
          entities: { only: %i[id kind count created_time modified_time] }
        }
      )
    else
      users.as_json(only: %i[id username email admin created_at])
    end

    render json: {
      users: users_json,
      meta: {
        total: total,
        page: page,
        per_page: per_page,
        total_pages: total_pages
      }
    }
  end

  private

  def authorize_admin
    unless @current_user&.admin?
      render json: { error: "You do not have permission to access this resource" }, status: :forbidden
    end
  end
end
