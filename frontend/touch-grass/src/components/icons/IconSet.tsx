import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export const DeleteFriendIcon = (props) => (
  <Ionicons name="home-outline" size={24} color="black" {...props} />
);

export const SendRequestIcon = (props) => (
  <Ionicons name="checkmark-circle" size={28} color="#00e676" />
);

export const RequestSentIcon = (props) => (
  <Ionicons name="checkmark-circle" size={24} color="#9e9e9e" {...props} />
);