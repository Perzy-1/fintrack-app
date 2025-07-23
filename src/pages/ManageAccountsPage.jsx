import React from 'react';
import AccountsPage from './AccountsPage'; // Re-use the same component

const ManageAccountsPage = (props) => {
	return <AccountsPage {...props} />;
};

export default ManageAccountsPage;
