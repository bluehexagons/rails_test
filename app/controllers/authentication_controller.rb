class AuthenticationController < ApplicationController
  # POST /auth/login
  def login
    identifier = params[:username] || params[:email]
    @user = User.find_by(username: identifier) || User.find_by(email: identifier)

    if @user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: @user.id)
      time = Time.now + 24.hours.to_i
      render json: { token: token, exp: time.strftime("%m-%d-%Y %H:%M"),
                     username: @user.username }, status: :ok
    else
      render json: { error: "Invalid username or password" }, status: :unauthorized
    end
  end

  # DELETE /auth/logout
  def logout
    render json: { message: "Logged out successfully" }, status: :ok
  end

  private

  def login_params
    params.permit(:email, :password, :username)
  end
end
