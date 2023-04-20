import React from "react";
import ReactPaginate from "react-paginate";
import "./pagination.css";

const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  //calculate the total number of pages
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  //handle the page click
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    onPageChange(selectedPage);
  };

  return (
    <div className="pagination-container">
      <ReactPaginate
        previousLabel={<span>&laquo;</span>}
        nextLabel={<span>&raquo;</span>}
        breakLabel={<span className="gap">...</span>}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
        forcePage={currentPage - 1}
      />
    </div>
  );
};

export default Pagination;
