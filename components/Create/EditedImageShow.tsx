'use client';
import React from 'react';

const EditedImageShow = ({result}) => {
    return (
        <div>
            {result && (
                <div>
                    <p>Image generated successfully!</p>
                    {/*<Image src={result} alt="Generated Image" layout="fill" objectFit="contain" />*/}
                </div>
            )}
        </div>
    );
};

export default EditedImageShow;
