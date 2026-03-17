class EntitiesController < ApplicationController
  before_action :authorize_request

  KIND_CLICK_COUNT = "click_count"
  KIND_STREAK_DAY = "streak_counter_day"
  KIND_STREAK_MONTH = "streak_counter_month"
  KIND_STREAK_YEAR = "streak_counter_year"
  MAX_RETRIES = 3

  # POST /entities/increment
  def increment_counter
    Entity.transaction do
      click_entity = Entity.lock.find_by(user: @current_user, kind: KIND_CLICK_COUNT)
      last_modified = click_entity&.modified_time

      if click_entity
        click_entity.count += 1
        click_entity.save!
      else
        click_entity = create_entity_with_retry(KIND_CLICK_COUNT, 1)
      end

      today = Time.current.to_date
      last_date = last_modified&.to_date

      streak_day = update_streak(KIND_STREAK_DAY, last_date, today, today - 1.day)

      current_month = today.beginning_of_month
      last_month = last_date&.beginning_of_month
      streak_month = update_streak(KIND_STREAK_MONTH, last_month, current_month, current_month - 1.month)

      current_year = today.beginning_of_year
      last_year = last_date&.beginning_of_year
      streak_year = update_streak(KIND_STREAK_YEAR, last_year, current_year, current_year - 1.year)

      render_entities(click_entity, streak_day, streak_month, streak_year)
    end
  end

  # GET /entities/current
  def current
    entities = Entity.where(user: @current_user, kind: [ KIND_CLICK_COUNT, KIND_STREAK_DAY, KIND_STREAK_MONTH, KIND_STREAK_YEAR ])
                     .index_by(&:kind)

    click_entity = entities[KIND_CLICK_COUNT]
    streak_day = entities[KIND_STREAK_DAY]
    streak_month = entities[KIND_STREAK_MONTH]
    streak_year = entities[KIND_STREAK_YEAR]

    render_entities(click_entity, streak_day, streak_month, streak_year)
  end

  private

  def create_entity_with_retry(kind, count)
    retries = 0
    begin
      Entity.create!(user: @current_user, kind: kind, count: count)
    rescue ActiveRecord::RecordNotUnique
      retries += 1
      retry if retries < MAX_RETRIES
      raise
    end
  end

  def update_streak(kind, last_period, current_period, previous_period)
    streak = Entity.lock.find_by(user: @current_user, kind: kind)

    if streak
      if last_period == previous_period
         streak.count += 1
         streak.save!
      elsif last_period != current_period
         streak.count = 1
         streak.save!
      end
    else
      streak = create_entity_with_retry(kind, 1)
    end
    streak
  end

  def render_entities(click_entity, streak_day, streak_month, streak_year)
    render json: {
      click_count: click_entity,
      streak_counter_day: streak_day,
      streak_counter_month: streak_month,
      streak_counter_year: streak_year
    }
  end
end
