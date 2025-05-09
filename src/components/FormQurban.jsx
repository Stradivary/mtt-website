// src/components/GoogleFormEmbed.jsx
import React from 'react';

const GoogleFormEmbed = () => {
  return (
    <div className="w-full flex justify-center">
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSfR_4OF5rqy34zZoJgS7he-CiLP0NmIcHwxe7nqU5J0aXURkg/viewform?embedded=true"
        width="640"
        height="800"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title="Google Form"
      >
        Loading…
      </iframe>
    </div>
  );
};

export default GoogleFormEmbed;
