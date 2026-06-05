class UsersController < ApplicationController
  before_action :authorize_request, except: :create

  # POST /users
  def create
    @user = User.new(user_params)
    if @user.save
      token = JsonWebToken.encode(user_id: @user.id)
      refresh_raw = RefreshToken.generate_for(@user)
      render json: { user: @user, token: token, refresh_token: refresh_raw }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /me
  def me
    render json: @current_user, status: :ok
  end

  private

  def user_params
    allowed_fields = %i[email password password_confirmation username]
    nested_user_params = params.fetch(:user, {}).permit(*allowed_fields).to_h
    top_level_params = params.permit(*allowed_fields).to_h

    nested_user_params.reverse_merge(top_level_params)
  end
end
