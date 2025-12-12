# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

User.find_or_create_by!(username: 'admin') do |user|
  password = SecureRandom.hex(12)
  user.email = 'admin@example.com'
  user.password = password
  user.password_confirmation = password
  user.admin = true

  puts "\n" + "="*50
  puts "ADMIN USER CREATED"
  puts "Username: admin"
  puts "Password: #{password}"
  puts "Please save this password immediately!"
  puts "="*50 + "\n"
end
