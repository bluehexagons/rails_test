class EntitiesController < ApplicationController
  before_action :authorize_request

  # POST /entities/increment
  def increment_counter
    click_kind = "click_count"

    Entity.transaction do
      click_entity = Entity.lock.find_by(user: @current_user, kind: click_kind)
      last_modified = click_entity&.modified_time

      if click_entity
        click_entity.count += 1
        click_entity.save!
      else
        begin
          click_entity = Entity.create!(user: @current_user, kind: click_kind, count: 1)
        rescue ActiveRecord::RecordNotUnique
          retry
        end
      end

      today = Time.current.to_date
      last_date = last_modified&.to_date

      streak_day = update_streak("streak_counter_day", last_date, today, today - 1.day)

      current_month = today.beginning_of_month
      last_month = last_date&.beginning_of_month
      streak_month = update_streak("streak_counter_month", last_month, current_month, current_month - 1.month)

      current_year = today.beginning_of_year
      last_year = last_date&.beginning_of_year
      streak_year = update_streak("streak_counter_year", last_year, current_year, current_year - 1.year)

      render_entities(click_entity, streak_day, streak_month, streak_year)
    end
  end

  # GET /entities/current
  def current
    click_entity = Entity.find_by(user: @current_user, kind: "click_count")
    streak_day = Entity.find_by(user: @current_user, kind: "streak_counter_day")
    streak_month = Entity.find_by(user: @current_user, kind: "streak_counter_month")
    streak_year = Entity.find_by(user: @current_user, kind: "streak_counter_year")

    render_entities(click_entity, streak_day, streak_month, streak_year)
  end

  private

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
      begin
        streak = Entity.create!(user: @current_user, kind: kind, count: 1)
      rescue ActiveRecord::RecordNotUnique
        retry
      end
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
