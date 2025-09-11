import React, { useState } from 'react';

const SearchInputWithDropdown = () => {
    const [searchQuery, setSearchQuery] = useState(''); // Nuevo estado para el input
    const [selectedCategory, setSelectedCategory] = useState('Categorías');

    const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes'];

    // Nueva función handleSearch dentro del componente
    const handleSearch = () => {
        // Aquí iría la lógica de búsqueda. Por ejemplo, redirección o llamada a una API
        console.log(`Buscando "${searchQuery}" en la categoría "${selectedCategory}"`);
        alert(`Buscando "${searchQuery}" en la categoría "${selectedCategory}"`);
    };

    return (
        <>
            <div class="input-group">
                <input type="text" className="form-control" placeholder="Buscar sello hidráulico" aria-label="Recipient's username" aria-describedby="basic-addon2"/>
                    <div class="input-group-append">
                        <button className="btn" type="button" style={{backgroundColor: "#0458c7", color:"#fff", borderRadius:"0 5px 5px 0"}}>Buscar</button>
                    </div>
            </div>
            {/* <div className="input-group mb-3">
           
            <div className="input-group-prepend">
                <button 
                    className="btn btn-outline-secondary dropdown-toggle" 
                    type="button" 
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false"
                >
                    {selectedCategory}
                </button>
                <div className="dropdown-menu">
                    {categories.map((category) => (
                        <a 
                            key={category}
                            className="dropdown-item" 
                            href="#"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </a>
                    ))}
                </div>
            </div>
            
            
            <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar productos..."
                aria-label="Buscar"
                value={searchQuery} // Conecta el estado al input
                onChange={(e) => setSearchQuery(e.target.value)} // Actualiza el estado al escribir
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(); // Activa la búsqueda con la tecla Enter
                }}
            />
            
           
            <div className="input-group-append">
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={handleSearch} // Activa la búsqueda al hacer clic
                >
                    <span role="img" aria-label="lupa">🔍</span>
                </button>
            </div>
        </div> */}
        </>
    );
};

export default SearchInputWithDropdown;