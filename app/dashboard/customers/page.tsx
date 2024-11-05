import { Metadata} from 'next';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';
//import { Suspense } from 'react';
//import { InvoicesTableSkeleton } from '@/app/ui/skeletons';


export const metadata: Metadata = {
    title: 'Customers',
}

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}){

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const customers = await fetchFilteredCustomers(query); 

    return (
   <div className='w-full'>
        {/* <Suspense fallback={<InvoicesTableSkeleton />}> */}
        <CustomersTable customers={customers}/>
        {/* </Suspense> */}
   </div>
    )
}