import PropTypes from 'prop-types';
import { ImageUpload } from './ImageUpload';

export const UserHeader = ({ 
    user, 
    files, 
    setFiles, 
    uploadState, 
    handleFileUpload 
}) => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <ImageUpload
            type="avatar"
            image={user?.avatar}
            file={files.avatar}
            setFiles={setFiles}
            handleUpload={handleFileUpload}
            uploadState={uploadState}
            isGoogleUser={user?.isGoogleUser}
            className="-mt-20"
        />
        
        <UserInfo user={user} />
    </div>
);

UserHeader.propTypes = {
    user: PropTypes.object.isRequired,
    files: PropTypes.object.isRequired,
    setFiles: PropTypes.func.isRequired,
    uploadState: PropTypes.object.isRequired,
    handleFileUpload: PropTypes.func.isRequired
};