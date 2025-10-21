import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/User.Context';
import { getAllDisciplinas } from '../api/disciplinas.api';
import { getAllCategorias } from '../api/categorias.api';
import { actualizarPerfilDeportivo } from '../api/usuarios.api';
import { toast } from 'react-hot-toast';
import { FaUser } from 'react-icons/fa';

// 1. Importa el nuevo componente de formulario
import PerfilDeportivoForm from '../components/PerfilDeportivoForm/PerfilDeportivoForm.jsx';

export default function MiPerfilPage() {
  const { user, refreshUser } = useContext(UserContext);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsDataLoading(true);
      try {
        const [disciplinasData, categoriasData] = await Promise.all([
          getAllDisciplinas(),
          getAllCategorias(),
        ]);
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error cargando datos para el perfil', error);
        toast.error('No se pudieron cargar los datos necesarios.');
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, []); // El array de dependencias está vacío para que se ejecute solo una vez

  // 2. Define la función de guardado que pasarás como prop
  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      await actualizarPerfilDeportivo(data);
      await refreshUser(); // Actualiza los datos del usuario en el contexto
      toast.success('¡Perfil actualizado con éxito!');
    } catch (error) {
      toast.error('Hubo un error al guardar tu perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <div className="text-center p-8">Cargando datos del perfil...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3 mb-6">
        <FaUser />
        Mi Perfil Deportivo
      </h1>
      
      {/* 3. Renderiza el componente de formulario pasando los datos y funciones */}
      <PerfilDeportivoForm
        disciplinas={disciplinas}
        categorias={categorias}
        initialDisciplina={user?.socio_info?.disciplina}
        initialCategoria={user?.socio_info?.categoria}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}