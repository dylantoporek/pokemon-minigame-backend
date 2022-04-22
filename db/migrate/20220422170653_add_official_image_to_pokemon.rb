class AddOfficialImageToPokemon < ActiveRecord::Migration[7.0]
  def change
    add_column :pokemons, :official_image, :string
  end
end
