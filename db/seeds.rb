require "pry"
puts "Seeding Data"

pokemonList = HTTParty.get('https://pokeapi.co/api/v2/pokemon?limit=898&offset=0')

pokemonMasterList = pokemonList['results'].map do |pokemon|
 HTTParty.get(pokemon['url'])
end

pokemonFilteredDataList = pokemonMasterList.map do |pokemon|
    {
        name: pokemon['name'],
        type_one: pokemon['types'][0]['type']['name'],
        type_two: pokemon['types'][1] ? pokemon['types'][1]['type']['name'] : nil,
        image: pokemon['sprites']['front_default'],
        official_image: pokemon['sprites']['other']['official-artwork']['front_default'],
        hp: pokemon['stats'][0]['base_stat'],
        attack: pokemon['stats'][1]['base_stat'],
        defense: pokemon['stats'][2]['base_stat'],
        special_attack: pokemon['stats'][3]['base_stat'],
        special_defense: pokemon['stats'][4]['base_stat'],
        speed: pokemon['stats'][5]['base_stat'],
    }
end
# binding.pry


Pokemon.create!(pokemonFilteredDataList)


puts "Done Seeding"

