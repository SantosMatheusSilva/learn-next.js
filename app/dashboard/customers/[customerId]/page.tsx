import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomerById} from "@/app/lib/data";
import  Table  from "@/app/ui/invoices/table";
import { Suspense } from "react";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function Page({ params } : { params: {customerId : string, query: string}}){
    console.log(params);
    const {customerId} = params;
    const {query} = params;
    //const {currentPage} = params;
    
    const customer = await fetchCustomerById(customerId);
    //const invoices = await fetchInvoicesByCustomerId(customerId, 1);

    
    if (!customer) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
                { label: 'Customers', href: '/dashboard/customers' },
                {
                    label: 'Customer Details',
                    href: '/dashboard/customers/custumer-details',
                    active: true,
                },
            ]}
            />
            <div>
             <div className="flex flex-row gap-5 bg-gray-100 rounded-fulls rounded-lg p-2 items-center text-xl justify-between px-3">
             <Image 
             src={customer.image_url || 'https://i.pravatar.cc/300'} 
             className="rounded-full"
             width={70}
             height={70}
             alt={`${customer.name}'s profile picture`}
             />
                <div>
                    <p className="text-sm text-gray-600 mt-2">Name:</p>
                    <p className=''>{customer.name}</p>      
                </div>  
                <div>
                    <p className="text-sm text-gray-600 mt-2">Email:</p>
                    <p>{customer.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mt-2">Total Invoices:</p>
                    <p className="">{customer.total_invoices}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mt-2">Total Pending:</p>
                    <p className="">{customer.total_pending}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mt-2">Total Paid:</p>
                    <p className="">{customer.total_paid}</p>
                </div>

             </div>
             <div className="mt-6">
             <div className="ml-2">
             <h1 className='text-xl md:text-xl'>
                {`${customer.name} Invoices`} 
             </h1>
             </div>
             <Suspense key={query} fallback={<InvoicesTableSkeleton />}>
            <Table  query={query} customerId={customerId} currentPage={1}/>
            </Suspense>
             </div>
            
            </div>
            
        </main>
    )
}