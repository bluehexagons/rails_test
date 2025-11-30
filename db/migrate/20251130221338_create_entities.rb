class CreateEntities < ActiveRecord::Migration[8.1]
  def change
    create_table :entities do |t|
      t.string :kind
      t.integer :count
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_index :entities, [ :user_id, :kind ], unique: true
  end
end
