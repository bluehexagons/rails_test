class Entity < ApplicationRecord
  belongs_to :user

  before_create :set_created_time
  before_save :set_modified_time

  private

  def set_created_time
    self.created_time = Time.current
  end

  def set_modified_time
    self.modified_time = Time.current
  end
end
