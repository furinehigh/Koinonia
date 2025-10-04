import { Plus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function Header() {
    return (
        <div className='fixed w-full z-50 bg-black border-b border-gray-500 p-3 flex justify-between items-center'>
            <div>
                <h1 className='font-extrabold text-2xl'>
                    Koinonia
                </h1>
            </div>
            <div className='flex space-x-2'>
                <button className='bg-black cursor-pointer border-2 border-white hover:bg-white hover:border-black hover:text-black transition duration-300 text-white font-extrabold p-2 rounded flex items-center space-x-1'>
                    <span>Join</span>
                </button>
                <button className='bg-white cursor-pointer border-2 border-black hover:border-white hover:bg-black hover:text-white transition duration-300 text-black font-extrabold p-2 rounded flex items-center space-x-1'>
                    <span>Create</span> <Plus className='' strokeWidth={3} />
                </button>
                <button className='cursor-pointer border-2 p-2 border-white rounded flex items-center space-x-1'>
                    <Image src={'vercel.svg'} width={20} height={20} alt='user' />
                </button>
            </div>
        </div>
    )
}

export default Header