
import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpiner';
import {useHttpClient} from '../../shared/hooks/http-hook'
const Users = () => {
  const {isLoading ,error ,sendRequest, clearError} = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users');
        
        // const responseData = await response.json();

        // if (!response.ok) {
        //   throw new Error(responseData.message);
        // }

        setLoadedUsers(response.exsistingUser);
        
      } catch (err) {
        console.log(process.env.REACT_APP_BACKEND_URL);
      }
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
