class AddCustomTimestampsToEntities < ActiveRecord::Migration[8.1]
  def change
    add_column :entities, :created_time, :datetime
    add_column :entities, :modified_time, :datetime
  end
end
