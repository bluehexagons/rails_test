class EntitiesController < ApplicationController
  before_action :authorize_request

  # POST /entities/increment
  def increment_counter
    kind = "click_count"

    Entity.transaction do
      entity = Entity.lock.find_by(user: @current_user, kind: kind)

      if entity
        entity.count += 1
        entity.save!
      else
        begin
          entity = Entity.create!(user: @current_user, kind: kind, count: 1)
        rescue ActiveRecord::RecordNotUnique
          retry
        end
      end

      render json: { count: entity.count, kind: entity.kind }
    end
  end

  # GET /entities/current
  def current
    entity = Entity.find_by(user: @current_user, kind: "click_count")
    count = entity ? entity.count : 0
    render json: { count: count }
  end
end
