class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :render_parameter_missing

  def authorize_request
    header = request.headers["Authorization"]
    header = header.split(" ").last if header
    begin
      @decoded = JsonWebToken.decode(header)
      @current_user = User.find(@decoded[:user_id])
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: "User not found" }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { error: "Invalid token" }, status: :unauthorized
    end
  end

  private

  def render_unprocessable_entity(e)
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def render_parameter_missing(e)
    render json: { error: e.message }, status: :bad_request
  end
end
