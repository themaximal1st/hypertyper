export default function Typer(params) {
    if (!params.show) return;

    return (
        <>
            <div className="flex text-white mt-10 text-sm gap-2 px-2 w-6/12 absolute z-20">
                {params.hyperedge.map((symbol, i) => {
                    return (
                        <div className="flex gap-2 items-center" key={i}>
                            <a
                                onClick={(e) => params.removeIndex(i)}
                                className="cursor-pointer text-sm opacity-80 hover:opacity-100 transition-all"
                            >
                                {symbol}
                            </a>
                            <span className="opacity-80">→</span>
                        </div>
                    );
                })}
            </div>

            <form
                onSubmit={params.addInput}
                className="absolute inset-0 flex flex-col z-30 pointer-events-none"
            >
                <input
                    type="text"
                    tabIndex={-1}
                    ref={params.inputRef}
                    className="text-4xl bg-transparent text-center text-white mx-auto outline-none mt-10 py-2 w-full max-w-sm pointer-events-auto"
                    value={params.input}
                    onChange={params.changeInput}
                />
            </form>
        </>
    );
}
