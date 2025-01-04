import Image from "next/image";
import JM from "@/public/jenm.jpg";
import GiftCard from "@/components/GiftCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const gifts = await prisma.gift.findMany();

  return (
    <div className="">
      <h1 className="flex font-parisienne text-6xl pt-11 items-center justify-center ">
        Justin & Michelle
      </h1>
      <p className=" flex items-center justify-center text-sm pt-6">
        19 juni 2026
      </p>
      <div className="pt-8 flex flex-col items-center justify-center">
        <Image
          className="rounded-md"
          src={JM}
          alt="Justin en Michelle"
          height={1024}
          width={768}
        />
        <p className="pt-8 max-w-[768px]">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. It has survived not
          only five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
        <p className="pt-8 max-w-[768px]">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. It has survived not
          only five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
        <p className="pt-8 max-w-[768px]">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. It has survived not
          only five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6 pt-12">
        {gifts.map((gift) => {
          const paidEuro = gift.totalPaidCents / 100;
          const maxEuro = gift.maxCents / 100;
          return (
            <GiftCard
              key={gift.id}
              id={gift.id}
              title={gift.title}
              description={gift.description ?? ""}
              image={gift.image ?? "/placeholder.svg"}
              paid={paidEuro}
              max={maxEuro}
            />
          );
        })}
      </div>
    </div>
  );
}
