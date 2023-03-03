//React
import React from 'react';

interface progressBarData {
    progress: number;
    bgColor: string;
}

export default function ProgressBar(props: progressBarData) {    

    const fillerStyles = {
        height: '100%',
        width: `${props.progress}%`,
        backgroundColor: `${props.bgColor}`,
        borderRadius: 'inherit',
    }

    return (
        // <div style={containerStyles}>
        <div className='w-full h-8 bg-slate-100 rounded-md'>
            <div style={fillerStyles} className='flex items-center transition-all 1s ease-in-out'>
                <span className='ml-2 text-white align-middle text-sm'>{`${props.progress}%`}</span>
            </div>
        </div>
    )
  }
