class PokemonSerializer < ActiveModel::Serializer
  attributes :id, :name, :type_one, :type_two, :image, :official_image, :hp, :attack, :defense, :special_attack, :special_defense, :speed
end
