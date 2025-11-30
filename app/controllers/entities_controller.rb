class EntitiesController < ApplicationController
  before_action :authorize_request

  # POST /entities/increment
  def increment_counter
    # Ensure we are looking for the specific kind
    kind = "click_count"

    # Use a transaction to handle potential race conditions
    Entity.transaction do
      # Try to find the entity first
      entity = Entity.lock.find_by(user: @current_user, kind: kind)

      if entity
        # If found, increment
        entity.count += 1
        entity.save!
      else
        # If not found, create it.
        # Note: There is still a tiny race condition window between find and create
        # where another process could create it. The unique index protects the DB,
        # so we should handle the RecordNotUnique exception if that happens.
        begin
          entity = Entity.create!(user: @current_user, kind: kind, count: 1)
        rescue ActiveRecord::RecordNotUnique
          # If we hit the race condition, retry the find
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
