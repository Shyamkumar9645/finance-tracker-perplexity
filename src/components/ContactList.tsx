import React from 'react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact }) => {
  // Ensure contacts is always an array
  const contactsArray = Array.isArray(contacts) ? contacts : [];

  return (
    <div className="contact-list">
      <h2>Contacts</h2>
      {contactsArray.length === 0 ? (
        <p>No contacts yet. Add your first contact to get started.</p>
      ) : (
        <div className="contacts-grid">
          {contactsArray.map(contact => (
            <div key={contact.id} className="contact-card" onClick={() => onSelectContact(contact)}>
              <h3>{contact.name}</h3>
              {contact.phone && <p>📞 {contact.phone}</p>}
              {contact.email && <p>✉️ {contact.email}</p>}
              {contact.address && <p>📍 {contact.address}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};