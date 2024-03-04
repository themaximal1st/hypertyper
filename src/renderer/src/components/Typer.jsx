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

            <div className="relative h-40 max-w-xl mx-auto pointer-events-none">
                <form
                    onSubmit={params.addInput}
                    className="pointer-events-auto"
                >
                    <input
                        type="text"
                        tabIndex={-1}
                        ref={params.inputRef}
                        className="bg-transparent outline-none text-4xl text-center absolute z-30 left-0 right-0 top-10 py-2 text-white"
                        value={params.input}
                        onChange={params.changeInput}
                    />
                </form>
            </div>
        </>
    );
}
