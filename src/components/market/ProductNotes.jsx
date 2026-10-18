export default function ProductNotes({ notes }) {
	if (!notes?.trim()) return null;

	return (
		<p className="product-notes">
			<strong>OBS:</strong> {notes}
		</p>
	);
}
