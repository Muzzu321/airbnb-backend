import { Separator } from '@/components/ui/separator';
import React from 'react'
import EditProfile from './edit-profile';

const Profile = () => {
  return (
    <section>
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Basic Information for a faster booking experience
        </p>
      </div>
      <Separator className="mt-4 mb-6" />
      <EditProfile />
    </section>
  );
}

export default Profile