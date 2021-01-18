import React,{useEffect,useState} from 'react';
import { useParams } from 'react-router-dom';
import {useHttpClient} from '../../shared/hooks/http-hook'
import PlaceList from '../components/PlaceList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpiner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
 
// const DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u1'
//   },
//   {
//     id: 'p2',
//     title: 'Emp State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u2'
//   }
// ];

const UserPlaces =() => {
  const[loadedPlace,setLoadedPlace]= useState();
  const {isLoading,error,sendRequest,clearError} = useHttpClient()
  const userId = useParams().userId;


useEffect(()=>{

  const fetchPlaces = async()=>{
    
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
      );

      
      setLoadedPlace(responseData.places);
      
      
    } catch (err) {
      console.log(err);
    }
  
  }
  fetchPlaces(); 
},[sendRequest,userId])

 const placeDeleteHandler=async (deletedPlaceId)=>{
    setLoadedPlace(prevPlaces =>
    prevPlaces.filter( place => place.id !== deletedPlaceId));
 }


  // const loadedPlaces = DUMMY_PLACES.filter(place => place.creator === userId);
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
      {isLoading && (
        <div className="center">
          <LoadingSpinner/>
        </div>
      )}
  {!isLoading && loadedPlace &&<PlaceList items={loadedPlace} onDeletePlace={placeDeleteHandler} />}
  </React.Fragment>
    );
};

export default UserPlaces;
