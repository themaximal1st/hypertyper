export default function Typer(params) {
    if (!params.show) return;

    return (
        <div className="flex text-white mt-8 text-sm gap-2 px-2 absolute z-20 w-full">
            {params.hyperedge.map((symbol, i) => {
                return (
                    <div className="flex gap-2 items-center" key={i}>
                        <a
                            onClick={(e) => params.removeIndex(i)}
                            className="cursor-pointer"
                        >
                            {symbol}
                        </a>
                        →
                    </div>
                );
            })}

            <form onSubmit={params.addInput} className="">
                <input
                    type="text"
                    tabIndex={-1}
                    ref={params.inputRef}
                    className="bg-transparent outline-none text-4xl text-center absolute z-30 left-0 right-0 top-4 py-2"
                    value={params.input}
                    onChange={params.changeInput}
                />
            </form>
        </div>
    );
}
