import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GroupList from './GroupList';
import GroupForm from './GroupForm';

const GroupRoutes = () => (
  <Routes>
    <Route path="/groups" element={<GroupList />} />
    <Route path="/add-group" element={<GroupForm />} />
    <Route path="/edit-group/:id" element={<GroupForm />} />
  </Routes>
);

export default GroupRoutes;