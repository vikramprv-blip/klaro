type Props = {
  search: string;
  setSearch: (value: string) => void;
  clientId: string;
  setClientId: (value: string) => void;
  clients: any[];
};

export default function WorkboardFilters({
  search,
  setSearch,
  clientId,
  setClientId,
  clients,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row md:items-center">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by task or client"
        className="h-10 rounded-xl border px-3 text-sm outline-none"
      />

      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="h-10 rounded-xl border px-3 text-sm outline-none"
      >
        <option value="all">All clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}
